import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CdkProjectStack extends cdk.Stack {

  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps
  ) {

    super(scope, id, props);

   
    //  DynamoDB Table

    const table = new dynamodb.Table(this, 'StudentItemsTable', {

      tableName: 'StudentItems',

      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },

      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

      removalPolicy: cdk.RemovalPolicy.DESTROY
    });


    // Lambda Function

    const lambdaFunction = new lambda.Function(
      this,
      'StudentItemsLambda',
      {

        runtime: lambda.Runtime.NODEJS_20_X,

        architecture: lambda.Architecture.X86_64,

        handler: 'handler.handler',

        code: lambda.Code.fromAsset('lambda'),

        memorySize: 256,

        timeout: cdk.Duration.seconds(10),

        environment: {
          TABLE_NAME: table.tableName
        }
      }
    );


    // DynamoDB Permissions

    table.grantReadWriteData(lambdaFunction);


    // API Gateway REST API

    const api = new apigateway.RestApi(
      this,
      'StudentItemsApi',
      {

        restApiName: 'Student Items REST API',

        description:
          'REST API for managing StudentItems using Lambda and DynamoDB',

        deployOptions: {
          stageName: 'prod'
        }
      }
    );

   
    //  ./items Resource


    const items = api.root.addResource('items');


    // GET /items
    items.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaFunction)
    );


    // POST /items
    items.addMethod(
      'POST',
      new apigateway.LambdaIntegration(lambdaFunction)
    );


    // . /items/{id} Resource


    const item = items.addResource('{id}');


    // GET /items/{id}
    item.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaFunction)
    );


    // PUT /items/{id}
    item.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(lambdaFunction)
    );


    // DELETE /items/{id}
    item.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(lambdaFunction)
    );


    
    // CloudFormation Outputs

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName
    });

    new cdk.CfnOutput(this, 'LambdaName', {
      value: lambdaFunction.functionName
    });
  }
}