import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";


const client = new DynamoDBClient({});

const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;


// ==================================================
// Lambda Handler
// ==================================================

export const handler = async (event: any) => {

  try {

    console.log("Event:", JSON.stringify(event));


    const method = event.httpMethod;

    const id = event.pathParameters?.id;


    // ==================================================
    // GET /items
    // ==================================================

    if (method === "GET" && !id) {

      const result = await dynamodb.send(
        new ScanCommand({
          TableName: TABLE_NAME
        })
      );

      return {
        statusCode: 200,

        body: JSON.stringify(
          result.Items || []
        )
      };
    }


    // ==================================================
    // POST /items
    // ==================================================

    if (method === "POST") {

      const body = JSON.parse(
        event.body || "{}"
      );


      if (!body.id || !body.name) {

        return {
          statusCode: 400,

          body: JSON.stringify({
            message: "id and name are required"
          })
        };
      }


      const item = {

        id: body.id,

        name: body.name,

        description:
          body.description || "",

        category:
          body.category || ""
      };


      await dynamodb.send(
        new PutCommand({
          TableName: TABLE_NAME,

          Item: item
        })
      );


      return {

        statusCode: 201,

        body: JSON.stringify({

          message:
            "Item created successfully",

          item
        })
      };
    }


    // ==================================================
    // GET /items/{id}
    // ==================================================

    if (method === "GET" && id) {

      const result = await dynamodb.send(

        new GetCommand({

          TableName: TABLE_NAME,

          Key: {
            id: id
          }
        })
      );


      if (!result.Item) {

        return {

          statusCode: 404,

          body: JSON.stringify({

            message:
              "Item not found"
          })
        };
      }


      return {

        statusCode: 200,

        body: JSON.stringify(
          result.Item
        )
      };
    }


    // ==================================================
    // PUT /items/{id}
    // ==================================================

    if (method === "PUT" && id) {

      const body = JSON.parse(
        event.body || "{}"
      );


      const result = await dynamodb.send(

        new UpdateCommand({

          TableName: TABLE_NAME,

          Key: {
            id: id
          },

          UpdateExpression:
            "SET #name = :name, #description = :description, #category = :category",

          ExpressionAttributeNames: {

            "#name": "name",

            "#description":
              "description",

            "#category":
              "category"
          },

          ExpressionAttributeValues: {

            ":name":
              body.name || "",

            ":description":
              body.description || "",

            ":category":
              body.category || ""
          },

          ReturnValues: "ALL_NEW"
        })
      );


      return {

        statusCode: 200,

        body: JSON.stringify({

          message:
            "Item updated successfully",

          item: result.Attributes
        })
      };
    }


    // ==================================================
    // DELETE /items/{id}
    // ==================================================

    if (method === "DELETE" && id) {

      await dynamodb.send(

        new DeleteCommand({

          TableName: TABLE_NAME,

          Key: {
            id: id
          }
        })
      );


      return {

        statusCode: 200,

        body: JSON.stringify({

          message:
            "Item deleted successfully",

          id: id
        })
      };
    }


    // ==================================================
    // Unsupported request
    // ==================================================

    return {

      statusCode: 400,

      body: JSON.stringify({

        message:
          "Unsupported request"
      })
    };


  } catch (error) {

    console.error(
      "Error:",
      error
    );


    return {

      statusCode: 500,

      body: JSON.stringify({

        message:
          "Internal Server Error"
      })
    };
  }
};