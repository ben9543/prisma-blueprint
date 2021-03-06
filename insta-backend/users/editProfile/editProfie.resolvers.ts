require('dotenv').config();
import fs from "fs";
import { IResolvers } from "apollo-server-express";
import { BasicReturnType } from "../users.types";
import { checkUndefined, checkType, checkNull, removeWhitespaces, saveAvatarDemo } from "../users.utils";
import client from "../../client";
import bycrypt from "bcrypt";
import { FileUpload } from "@apollographql/graphql-upload-8-fork";

type Undefinable = string | undefined;

type EditProfileProp = {
    firstName: Undefinable
    lastName: Undefinable
    username: Undefinable
    email: Undefinable
    password : Undefinable
    token: Undefinable
    bio: Undefinable
    avatar: FileUpload
}

const EditProfileMutation: IResolvers = {
    Mutation: {
        editProfile: async(_, {
            firstName,
            lastName,
            username,
            email,
            password,
            bio,
            avatar
        }: EditProfileProp, 
        { currentUser, isLoggedIn } // context
        ): Promise<BasicReturnType> => {
            try {
                let avatar_url:string = "";
                isLoggedIn(currentUser);

                const argArray = [ firstName, lastName, username, email, password ];
                const salt = process.env.SALT || 10;
                const isNull = checkNull(argArray);
                const isType = checkType(argArray, 'string');

                if(isNull)
                    throw new Error("Wrong approach. Arguments cannot be 'null'.");
                if(isType)
                    throw new Error("Wrong input. Arguments must be 'string'.");
                if(username && await client.user.findUnique({where:{username}}))
                    throw new Error("The same username exists. Try others.");
                if(email && await client.user.findUnique({where:{email}}))
                    throw new Error("The same email exists. Try others.");

                // Remove White Spaces for inputs
                username = removeWhitespaces(username);
                password = removeWhitespaces(password);
                email = removeWhitespaces(email);
                firstName = removeWhitespaces(firstName);
                lastName = removeWhitespaces(lastName);

                // Hash Password
                if(checkUndefined([ password ]))
                    password = await bycrypt.hash(password, salt); 

                // Update avatar
                if(avatar)
                    avatar_url = await saveAvatarDemo(avatar, currentUser.id);
                console.log(avatar_url);

                // update user
                await client.user.update({where:{id: currentUser.id}, data:{username, email, password, firstName, lastName, bio, avatar: avatar_url}});
                return {
                    ok: true
                }
            } catch (error) {
                return {
                    ok: false,
                    error
                };
            }
        }
    }
}
export default EditProfileMutation;
