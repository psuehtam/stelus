FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs \
  && adduser -S -D -H -u 1001 -G nodejs stelus

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY assets ./assets
RUN mkdir -p generated uploads \
  && chown -R stelus:nodejs /app

USER stelus

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
