FROM node:22.14.0-alpine3.21 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27.5-alpine
ARG SOURCE_COMMIT=unknown
LABEL org.opencontainers.image.title="SYRE website" \
      org.opencontainers.image.revision="$SOURCE_COMMIT"
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/health | grep -q '"status":"ok"' || exit 1
CMD ["nginx", "-g", "daemon off;"]
