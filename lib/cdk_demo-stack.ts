import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";

export class CdkDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    //Dynamodb table
    const todoTable = new Table(this, "todo", {
      partitionKey: { name: "name", type: AttributeType.STRING },
    });

    // lambda function 1 GetAllTodosLambdaHandler
    const getAllTodosLambda = new Function(this, "GetAllTodosLambdaHandler", {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset("functions"),
      handler: "get-all-todos.getAllTodosHandler",
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,
      },
    });

    // permissions to lambda to dynamo table
    todoTable.grantReadWriteData(getAllTodosLambda);

    // lambda function 2 PutTodoLambdaHandler
    const putTodoLambda = new Function(this, "PutTodoLambdaHandler", {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset("functions"),
      handler: "put-todo.putTodoHandler",
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,
      },
    });

     // permissions to lambda to dynamo table    
     todoTable.grantReadWriteData(putTodoLambda);

    // create the API Gateway method and path
    const api = new RestApi(this, "todo-api");
    api.root
      .resourceForPath("todo")
      .addMethod("GET", new LambdaIntegration(getAllTodosLambda));

    api.root
    .resourceForPath("todo")
    .addMethod("POST", new LambdaIntegration(putTodoLambda));

    new CfnOutput(this, "API URL", {
      value: api.url ?? "Something went wrong"
    });

  }
}
