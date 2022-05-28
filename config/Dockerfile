FROM denoland/deno:1.17.3

EXPOSE 7621

WORKDIR /PRISM

USER deno

COPY src/deps.ts .
RUN deno cache deps.ts

ADD src .

# Adding the --watch flag may be beneficial on Non-M1 machines during development
# We allow write to /tmp as it's required by Oak for multipart requests
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-write=/tmp", "--allow-read", "--allow-run", "main.ts"]