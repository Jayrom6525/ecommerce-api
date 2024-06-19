const http = require('http');

// Function to make HTTP requests
const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
};

// Example GET request
const getProducts = async () => {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/products',
        method: 'GET',
    };

    try {
        const response = await makeRequest(options);
        console.log('Products:', response);
    } catch (error) {
        console.error('Error:', error);
    }
};

// Example POST request
const createProduct = async () => {
    const postData = JSON.stringify({
        name: 'Test Product',
        description: 'This is a test product',
        price: 19.99,
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/products',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
        },
    };

    try {
        const response = await makeRequest(options, postData);
        console.log('Product Created:', response);
    } catch (error) {
        console.error('Error:', error);
    }
};

// Test the API
getProducts();
// createProduct(); // Uncomment to test POST request
