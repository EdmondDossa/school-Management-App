class AuthService {
  static async createUser({ username, password }) {
    return await window.electronAPI.auth.createUser({ username, password });
  }

  static async verifyUser({ username, password }) {
    return await window.electronAPI.auth.verifyUser({ username, password });
  }

  static async hasUsers() {
    return await window.electronAPI.auth.hasUsers();
  }

  static async changePassword(username, newPassword) {
    return await window.electronAPI.auth.changePassword({
      username,
      newPassword,
    });
  }
}

export default AuthService;
