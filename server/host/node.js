import Promise from 'bluebird';
import {filter} from 'lodash';
import Gun from 'gun';
require('gun/lib/path');
require('gun/lib/load');
require('gun/lib/then');

/**
* A class to manage Gun nodes.
*/
class Node {
  /**
  * Constructor
  *
  * @param {object} peers of Gun
  * @param {object} name of the node
  */
  constructor(peers, name) {
    this.name = name;
    this.gun = new Gun({peers});
    this.node = this.gun.get(name);
  }


  /**
  * Get object and all its children
  *
  * @param {string} pathway - a.b.c or a
  * @param {boolean} filterNull - filter 'null' values in the 1st level
  * @return {array} value
  */
  load(pathway, filterNull = true) { // async/await is not used here because it doesn't work with Gun .load()
    return this.exists(pathway).then((exists) => {
      if (!exists) return null;
      return new Promise((resolve, reject) => {
        this.node.path(pathway).load(function(values) {
          values = !filterNull ? filter(values, (v) => v || !v) : filter(values, (v) => v);
          resolve(values);
        });
      });
    });
  }

  /**
  * Put value
  *
  * @param {string} pathway - a.b.c or a
  * @param {object} value
  * @return {object} new Gun node which contains value properties
  */
  async put(pathway, value) {
    return await this.node.path(pathway).put(value).then();
  }

  /**
  * Check if value exists
  *
  * @param {string} pathway - a.b.c or a
  * @return {boolean}
  */
  async exists(pathway) {
    const value = await this.node.path(pathway).val().then();
    return value ? true : false;
  }

  /**
  * Get data by path
  *
  * @param {string} pathway - a.b.c or a
  * @return {object} value
  */
  async path(pathway) {
    return await this.node.path(pathway).val().then();
  }

  /**
  * Delete data
  *
  * @param {string} pathway - a.b.c or a
  * @return {object} null
  */
  async delete(pathway) {
    return await this.node.path(pathway).put(null).then();
  }

  /**
  * Self-destruct node
  *
  * @return {object} null
  */
  async _selfDestruct() {
    return await this.gun.get(this.name).put({}).then();
  }
}

export default Node;
