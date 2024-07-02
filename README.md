# 360Lab WebApp

## Demo

![demo](demo.mp4)

## Tech Stack

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

The following technologies are used:

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Development

* Ensure `pnpm` and `nodejs` are installed

* Clone and `cd` to this repo:

```sh
$ git clone https://github.com/dash-l/360lab-webapp && cd 360lab-webapp
```

* Copy `.env.example` to `.env` and set the required variables (note that the `MATTERPORT_API_*` variables are not required at the moment)

* For the links in the Matterport model to work in development, the domain `example.com` needs to point to `localhost` (`127.0.0.1`). The easiest way of doing this, at least on linux,
is to add `127.0.0.1 example.com` as an entry to `/etc/hosts`. Windows has a `hosts` file as well, which may work the same way.

* run `pnpm install`

* run `pnpm dev`

* Go to `localhost:3000` in a browser
