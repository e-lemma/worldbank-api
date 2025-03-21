import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand,GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

dotenv.config();
type Event = {httpMethod: string,queryStringParameters: {email: string,password: string},body: {email:string,password:string}}
export class Page {
    clientConnection(){
        const client = new DynamoDBClient({
            region: "eu-west-2"
        })
        return DynamoDBDocumentClient.from(client)
    }
    async registerUser (email: string,pass: string,key: string,client: DynamoDBDocumentClient){
        const checkList = await this.getExistingUsers(client);
        if (checkList.includes(email)){
            return {
                statusCode: 400,
                body: JSON.stringify("Account with given email already exists.")
            }
        }
        const command = new PutCommand({
            TableName: "wb-api-users",
            Item: {
                email: email,
                password: pass,
                accessToken:key,
                createdAt: new Date().toISOString()
            }
        })
        try {
            await client.send(command);
            console.log(`Uploaded: ${email}`);
            console.log("You may now log in.")
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
            return response.Items?.map(item => item.email) || [];
        } catch (error) {
            console.error(`Error fetching emails: ${error}`); // dev log
            return [];
        }
    }
    async checkPassword(email: string, pass:string,client: DynamoDBDocumentClient): Promise<boolean>{
        const command = new GetCommand({
            TableName: "wb-api-users",
            Key: {email: email},
        })
        try {
            const response = await client.send(command);
            return response.Item?.password === pass;
        } catch (error) {
            console.error(`Error checking password: ${error}`);
            return false;
        }
    }
    async loginUser (email: string,pass: string,client: DynamoDBDocumentClient){
        const checkList = await this.getExistingUsers(client)

        if (checkList.includes(email))if (checkList.includes(email)) {
            const command = new GetCommand({
                TableName: "wb-api-users",
                Key: { email: email }
            });

            try {
                const response = await client.send(command);
                const userKey = response.Item?.accessToken;
                const checkPass = await this.checkPassword(email, pass, client);

                if (checkPass) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(`Login Successful\n Please feel free to navigate to a different page, and provide this key:${userKey}`)
                    };
                }
                else{
                    return {
                        statusCode: 400,
                        body: `Error logging in: Password incorrect`
                    }
                }
            } catch (error) {
                return {
                    statusCode: 500,
                    body: `Error during login: ${error}`
                }
            }
        }
        return {
                statusCode: 200,
                body: JSON.stringify("Could not find an account with that email. Do you want to register?")
            }
    }
}

export const handler = async (event: Event)=>{
    const newPage = new Page();
    const client = newPage.clientConnection()
    
    if (event.httpMethod=== "POST"){
        const requestBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const correctEmailFormat = new RegExp("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
        if (!correctEmailFormat.test(requestBody.email)){
           return {
                statusCode: 400,
                body: "Invalid email address"
            }
        }
        const email = requestBody.email;

        const password = requestBody.password;
        const newKey = crypto.randomUUID();

        return await newPage.registerUser(email, password, newKey, client);
    }
    if (event.httpMethod=== "GET"){
        const email = event.queryStringParameters.email
        const password = event.queryStringParameters.password
        return await newPage.loginUser(email, password, client);
    }
}
