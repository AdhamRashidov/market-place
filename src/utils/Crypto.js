import bcrypt from 'bcrypt';

class Crypto {
    async encrypt(data) {
        return bcrypt.hash(data, 7);
    }

    async decrypt(data, encryptedData) {
        return bcrypt.compare(data, encryptedData);
    }
}

export default new Crypto();