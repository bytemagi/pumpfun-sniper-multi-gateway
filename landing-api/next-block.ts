import axios from "axios";
import { NEXT_BLOCK_URL } from "../config";

const submitTransaction = async (transactionContent: string, AUTH_HEADER: string) => {
  try {
    const response = await axios.post(
      NEXT_BLOCK_URL,
      {
        transaction: {
          content: transactionContent,
        },
      },
      {
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    //  @ts-ignore
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

export {
  submitTransaction
}