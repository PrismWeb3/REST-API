FROM denoland/deno:1.17.3

EXPOSE 7621

WORKDIR /PRISM

USER deno

COPY src/deps.ts .
RUN deno cache deps.ts

ADD src .

# Adding the --watch flag may be beneficial for Non-M1 machines for easier development flow
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "--allow-run", "main.ts"]