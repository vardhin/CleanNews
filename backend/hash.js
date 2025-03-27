/**
 * Generates a 6-character hash from a string input
 * @param {string} input - The string to hash
 * @returns {string} A 6-character hash using English characters and numbers
 */
function generateHash(input) {
    // Define the character set (a-z, A-Z, 0-9)
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    // Initialize hash value
    let hash = 0;
    
    // Generate a numeric hash from the input string
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert the numeric hash to a 6-character string
    let result = '';
    for (let i = 0; i < 6; i++) {
        // Use the hash value to select a character
        const index = Math.abs(hash % chars.length);
        result += chars[index];
        // Rotate the hash value
        hash = ((hash << 5) - hash) + i;
        hash = hash & hash;
    }
    
    return result;
}

module.exports = {
    generateHash
};
