import ApiService from './api';

/**
 * CategoryStore manages expense categories
 * Backend returns ExpenseCategoryResponseDTO: {id, categoryName, description, colorCode, isActive}
 */
class CategoryStore {
  constructor() {
    this.categories = []; // Array of full category objects from backend
    this.subscribers = new Set();
    // initial load
    this.refresh();
  }

  async refresh() {
    try {
      // Backend returns ExpenseCategoryResponseDTO[]
      const response = await ApiService.get('/expense-categories');

      // Normalize response - backend returns array of category DTOs
      let cats = [];
      if (Array.isArray(response)) {
        // Store full category objects
        cats = response.filter(cat => cat && cat.id);
      } else if (response && Array.isArray(response.data)) {
        cats = response.data.filter(cat => cat && cat.id);
      }

      // Only keep active categories for dropdown selection
      this.categories = cats.filter(cat => cat.isActive !== false);
      this.notify();
      return this.categories;
    } catch (error) {
      console.error('CategoryStore.refresh error:', error);
      // keep existing categories on error
      return this.categories;
    }
  }

  /**
   * Get all categories as full objects
   * @returns {Array} Array of {id, categoryName, description, colorCode, isActive}
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Get category names only (for backward compatibility)
   * @returns {Array<string>}
   */
  getCategoryNames() {
    return this.categories.map(cat => cat.categoryName);
  }

  /**
   * Find category by ID
   * @param {number} id 
   * @returns {object|null}
   */
  getCategoryById(id) {
    return this.categories.find(cat => cat.id === id) || null;
  }

  /**
   * Find category by name
   * @param {string} name 
   * @returns {object|null}
   */
  getCategoryByName(name) {
    return this.categories.find(cat => cat.categoryName === name) || null;
  }

  subscribe(cb) {
    this.subscribers.add(cb);
    // call immediately with current data
    try { cb(this.getCategories()); } catch (e) { console.error(e); }
    return () => this.subscribers.delete(cb);
  }

  notify() {
    for (const cb of this.subscribers) {
      try { cb(this.getCategories()); } catch (e) { console.error(e); }
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new CategoryStore();
