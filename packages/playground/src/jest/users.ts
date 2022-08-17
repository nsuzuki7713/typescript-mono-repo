import axios from 'axios';

/**
 *
 */
export class Users {
  /**
   * @returns レスポンス
   */
  static all() {
    return axios.get('/users.json').then((resp) => resp.data);
  }
}
