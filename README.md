# ip-to-domain
A Bun.js application that processes newly registered domains, resolves their IPv4 addresses, stores them in a MongoDB database, and provides an API to retrieve domains associated with a specific IP address. 

## Public API Access

The `ip-to-domain` API is publicly hosted and accessible to everyone.
You can access the API at:
```bash
curl https://ip-to-domain.mihnea.dev/$IP?json=$boolean
```
- Replace <IP> with the IPv4 address you want to query.
- Set json to true for a JSON response or false for a plain text response.

### Example:
```bash
curl https://ip-to-domain.mihnea.dev/188.114.96.3?json=false

# Output:
# slotsableng88.life
# ups4ds.life
# win-79.life
# 188bettt.org
# 313bet.org
# 6rp.org
# ada4ds.org
# ...
```

A more comprehensive guide can be found on my website, [mihnea.dev](https://www.mihnea.dev/ip-to-domain).

### Support & Future Plans
`ip-to-domain` is currently a free, publicly accessible API. However, as the project grows, there may be a need to introduce a subscription-based model to support ongoing development, infrastructure costs, and maintenance. If we decide to move to a paid model, we will communicate the changes well in advance, ensuring a smooth transition for all existing users.

In the meantime, if you find the project useful and would like to help fund its development, you can support it directly through...

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/mihnea.dev)

## Local Development

To run the application locally, you need to have:
- Bun.js 
- MongoDB 
- Redis 

1. clone the repository and install the dependencies, run:
```bash
git clone https://github.com/mihneamanolache/ip-to-domain.git
cd ip-to-domain
```
2. Install the dependencies:
```bash
bun install
```
3. Start the API/Worker:

- Export the required environment variables:
```bash
# MongoDB connection (required)
export MONGO_USER=your_mongo_username
export MONGO_PASS=your_mongo_password 
export MONGO_HOST=your_mongo_host
export MONGO_PORT=your_mongo_port

# Redis connection (required)
export REDIS_HOST=your_redis_host
export REDIS_PORT=your_redis_port

# API port (optional, default is 3000)
export PORT=your_api_port

# Save .zip files (optional, default is false)
export SAVE_ZIP=true
```

**Important**: PM2 does not currently support setting environment variables from the ecosystem file for Bun. You need to set them manually before starting the application.

- Using PM2:
```bash
# Copy and edit configuration file
cp ecosystem.config.example.js ecosystem.config.js
# Start the application
pm2 start ecosystem.config.js
```

- Using Bun.js:
```bash
bun start
```

## Contributing

Contributions are welcome! For feature requests, bug reports, or other feedback, please open an issue on GitHub. If you would like to contribute code, please submit a pull request.

## License

This project is open-source and available under the MIT License.
