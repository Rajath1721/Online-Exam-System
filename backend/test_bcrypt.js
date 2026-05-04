const bcrypt = require('bcryptjs');

async function test() {
    const hash = '$2y$10$wO3t6QYg6v4bYV8.B2Zz8.lUv2T8B8aYQ0vM4gXgZtI3A4T0JvPcC';
    try {
        const isMatch = await bcrypt.compare('admin123', hash);
        console.log('Match:', isMatch);
    } catch (err) {
        console.error('Error:', err);
    }
}
test();
