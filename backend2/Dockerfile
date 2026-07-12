# Change this first line:
FROM node:22-alpine

# The rest stays exactly the same...
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]