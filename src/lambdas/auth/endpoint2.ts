import { APIGatewayEvent, Context, Callback } from "aws-lambda";
import lambdaLocal from "lambda-local";
import path from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SecretsManagerClient, CreateSecretCommand } from "@aws-sdk/client-secrets-manager";
import { DynamoDBDocumentClient, PutCommand, ScanCommand,GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

dotenv.config();


export class Page {
    clientConnection(){
        const client = new DynamoDBClient({
            region: "eu-west-2",
            credentials:{
                accessKeyId: process.env.AWS_ACCESS_KEY!,
                secretAccessKey: process.env.AWS_SECRET_KEY!
            }
        })
        return DynamoDBDocumentClient.from(client)
    }
    async registerUser (email: string,pass: string,key: string,client: DynamoDBDocumentClient){
        const command = new PutCommand({
            TableName: "wb-api-users",
            Item: {
                email: email,
                password: pass,
                accessToken:key
            }
        })
        try {
            await client.send(command);
            console.log(`Uploaded: ${email}`);
            console.log("Please log in by setting 'new' to false")
            return {statusCode: 200,
                body: JSON.stringify("Account created successfully.")
            }
        } 
        catch (error) {
            return {
                statusCode: 500,
                message:`Error registering user: ${error}`
            }
        }
    }
    async getExistingUsers(client: DynamoDBDocumentClient){
        const command = new ScanCommand({
        TableName: "wb-api-users",
        ProjectionExpression: "email"
        })

        try {
            const response = await client.send(command);
            const emails = response.Items?.map(item => item.email) || [];
            return emails;
        } catch (error) {
            console.error(`Error fetching emails: ${error}`); // dev log
            return [];
        }
    }
    async checkPassword(email: string, pass:string,key: string,client: DynamoDBDocumentClient): Promise<boolean>{
        const command = new GetCommand({
            TableName: "wb-api-users",
            Key: {email: email},
        })
        const response = await client.send(command)
        console.log(response.Item?.password) // show me if accessed the password correctly
        if (response.Item?.password === pass){
            return true
        }
        return false
    }
    async loginUser (email: string,pass: string,key: string,client: DynamoDBDocumentClient){
        const checkList = await this.getExistingUsers(client)

        if (checkList.includes(email)){
            const command = new GetCommand({
            TableName: "wb-api-users",
            Key: {email: email},
            })
            const response = await client.send(command)
            const checkPass = await this.checkPassword(email,pass,client)

            if (checkPass){
                console.log(this.createSecret(key))
            }
            return {
                statusCode: 200,
                body: JSON.stringify("Login Successful\n Please feel free to navigate to a different page.")
            }
        }
        return {
                statusCode: 200,
                body: JSON.stringify("Could not find an account with that email. Do you want to register?")
            }
    }
    async createSecret(key: string){
        
        console.log(key)

        const client = new SecretsManagerClient()

        const createRequest = {
        Name: "dg/api_key",
        SecretBinary: new Uint8Array(),
        SecretString: key,
        ForceOverwriteReplicaSecret: true,
        }

        const command = new CreateSecretCommand(createRequest)
        const response = await client.send(command)

        if (response.Name != "dg/api_key"|| !response.Name){
            return "Login failed."
        }
        return `You have been successfully logged in!`
    }
};

const handler = async (event: {new: boolean,email:string,password:string})=>{
    const newPage = new Page();
    const client = newPage.clientConnection()
    const email = event.email
    const password = event.password
    
    if (event.new){
        const newKey = self.crypto.randomUUID().slice()
        return await newPage.registerUser(email,password,newKey,client)
    }
    else if (!event.new){
        return await newPage.loginUser(email,password,client)
    }
    const response = {
        statusCode: 400,
        body: JSON.stringify('Invalid event provided'),
    }
    return response;
}

const event = { 
            new: false,
            email: "testUser.email.com",
            password: "test-pass",
};
handler(event);

//  TODO: Finish the password check for a user. 


