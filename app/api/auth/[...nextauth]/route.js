import NextAuth from 'next-auth'
// import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import Twitter from "next-auth/providers/twitter";
// import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from "next-auth/providers/github";
import mongoose from 'mongoose';
import User from '@/models/User';
import Payment from '@/models/Payment';
import connectDB from '@/db/connectDb';

export const authoptions = NextAuth({
  providers: [
    // OAuth authentication providers...
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Twitter({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
    }),
    // AppleProvider({
    //   clientId: process.env.APPLE_ID,
    //   clientSecret: process.env.APPLE_SECRET
    // }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    // Passwordless / email sign in
    // EmailProvider({
    //   server: process.env.MAIL_SERVER,
    //   from: 'NextAuth.js <no-reply@example.com>'
    // }),            
  ],
  callbacks: {
    async signIn({ user, account }) {
      // if (account.provider === "github") {
      await connectDB();

      const currentUser = await User.findOne({ email: user.email });

      if (!currentUser) {
        const newUser = new User({
          email: user.email,
          username: user.name || user.email.split("@")[0],
          provider: account.provider, // store provider info
        });
        await newUser.save();
      }
      return true;
    },
    // return false;
    // },
    async session({ session }) {
      const dbUser = await User.findOne({ email: session.user.email })

      if (dbUser) {

        session.user.name = dbUser.username;
        session.user.provider = dbUser.provider
      }
      return session
    }
  }
})


export { authoptions as GET, authoptions as POST };