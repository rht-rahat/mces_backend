const db = require('../config/db');

// Helper to generate unique ID for JSON fallback
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// Check if a item matches standard filters (handling simple exact match, regex, or nested)
const matchesFilter = (item, filter) => {
  if (!filter || Object.keys(filter).length === 0) return true;
  
  for (const key in filter) {
    const filterVal = filter[key];
    const itemVal = item[key];
    
    if (filterVal && typeof filterVal === 'object' && filterVal.$regex) {
      const regex = new RegExp(filterVal.$regex, filterVal.$options || '');
      if (!regex.test(itemVal || '')) return false;
    } else if (filterVal && typeof filterVal === 'object' && filterVal.$or) {
      let orMatch = false;
      for (const cond of filterVal.$or) {
        if (matchesFilter(item, cond)) {
          orMatch = true;
          break;
        }
      }
      if (!orMatch) return false;
    } else {
      if (itemVal !== filterVal) return false;
    }
  }
  return true;
};

const modelHelper = {
  find: async (MongooseModel, collectionName, filter = {}, sort = null) => {
    if (db.isConnected()) {
      let query = MongooseModel.find(filter);
      if (sort) {
        query = query.sort(sort);
      }
      return await query.exec();
    } else {
      const store = db.getDB();
      let list = store[collectionName] || [];
      
      // Filter
      list = list.filter(item => matchesFilter(item, filter));
      
      // Sort
      if (sort) {
        const sortKey = Object.keys(sort)[0];
        const sortOrder = sort[sortKey]; // 1 or -1 or 'asc'/'desc'
        list = [...list].sort((a, b) => {
          let valA = a[sortKey];
          let valB = b[sortKey];
          if (typeof valA === 'string') {
            return sortOrder === 1 || sortOrder === 'asc' 
              ? valA.localeCompare(valB) 
              : valB.localeCompare(valA);
          }
          return sortOrder === 1 || sortOrder === 'asc' 
            ? (valA > valB ? 1 : -1) 
            : (valA < valB ? 1 : -1);
        });
      }
      
      return list;
    }
  },

  findOne: async (MongooseModel, collectionName, filter = {}) => {
    if (db.isConnected()) {
      return await MongooseModel.findOne(filter).exec();
    } else {
      const store = db.getDB();
      const list = store[collectionName] || [];
      return list.find(item => matchesFilter(item, filter)) || null;
    }
  },

  findById: async (MongooseModel, collectionName, id) => {
    if (db.isConnected()) {
      return await MongooseModel.findById(id).exec();
    } else {
      const store = db.getDB();
      const list = store[collectionName] || [];
      return list.find(item => item._id === id || item.id === id) || null;
    }
  },

  create: async (MongooseModel, collectionName, data) => {
    if (db.isConnected()) {
      const newItem = new MongooseModel(data);
      return await newItem.save();
    } else {
      const store = db.getDB();
      const newItem = {
        _id: generateId(),
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!store[collectionName]) {
        store[collectionName] = [];
      }
      store[collectionName].push(newItem);
      db.saveDB(store);
      return newItem;
    }
  },

  findByIdAndUpdate: async (MongooseModel, collectionName, id, updateData) => {
    if (db.isConnected()) {
      return await MongooseModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } else {
      const store = db.getDB();
      const list = store[collectionName] || [];
      const index = list.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      
      const updatedItem = {
        ...list[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      list[index] = updatedItem;
      store[collectionName] = list;
      db.saveDB(store);
      return updatedItem;
    }
  },

  findByIdAndDelete: async (MongooseModel, collectionName, id) => {
    if (db.isConnected()) {
      return await MongooseModel.findByIdAndDelete(id).exec();
    } else {
      const store = db.getDB();
      const list = store[collectionName] || [];
      const index = list.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      
      const deletedItem = list[index];
      list.splice(index, 1);
      store[collectionName] = list;
      db.saveDB(store);
      return deletedItem;
    }
  }
};

module.exports = modelHelper;
