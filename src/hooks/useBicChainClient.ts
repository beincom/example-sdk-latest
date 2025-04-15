import { useMemo } from "react";
import { ChainApiClient } from "@beincom/chain-client";
import { BIC_APP_API_URL, BIC_CHAIN_API_DEV_URL, BIC_CHAIN_API_NFT_LOCAL_URL, BIC_CHAIN_API_REL_URL, BIC_CHAIN_API_URL, BIC_CHAIN_API_WALLET_LOCAL_URL, BIC_ORIGIN } from "../utils";
import { useLocalStorage } from "usehooks-ts";
import { AuthSession } from "../types";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const mockUser = {
  sub: "b62021e6-50ce-43c2-b15a-a754a9f84400",
  email_verified: true,
  iss: "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_MGxohyEmC",
  "cognito:username": "truongthi1",
  origin_jti: "db7650b3-b82f-4526-b721-817af75a11c4",
  aud: "j71t9dm5kgn54ee8hq9559i67",
  event_id: "2972a6d5-16ab-446a-85a8-f2e92ec0c4cc",
  token_use: "id",
  auth_time: 1731315345,
  exp: 1732242603,
  iat: 1732242303,
  jti: "2f466589-079a-4266-8c6b-51468c762c0a",
  email: "truongthi+1@evol.vn",
};
const useChainApiClient = () => {
  const [session, setSession] = useLocalStorage<AuthSession | null>(
    "session",
    null
  );


  const refreshSession = async (): Promise<string> => { 
    if(!session) {
      return "";
    }
    const res = await axios.post<{ data: AuthSession }>(
      `${BIC_APP_API_URL}/v1/auth/public/refresh-session`,
      {
        refreshToken: session.refresh_token,
        device: {
          device_id: "9247532c-0f7d-4c02-8282-4b5d00879e1d",
          device_name:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          application: "BIC_GROUP",
          platform: "web",
        },
      },
      {
        headers: { "x-language": "en",
        "x-platform": "web",
        // 'origin': BIC_ORIGIN,
        'x-version-id': '2.3.0',},
      }
    );
    setSession(res.data.data);
    return res.data.data.id_token;
  }

  const client = useMemo( () => {
    if(!session) { 
      return;
    }
    const chainClient = new ChainApiClient({ baseUrl: BIC_CHAIN_API_URL, refreshSession })
      .setPlatformHeaders({
        "x-language": "en",
        "x-platform": "android",
        'x-version-id': '2.3.0',
        "Authorization": session?.id_token || "",
        // "Access-Control-Allow-Origin": "*",
        // "user": JSON.stringify(session?.id_token ? jwtDecode(session?.id_token): {}),
        "user": JSON.stringify(mockUser)
      })
      .includeCredentials()
    return chainClient;
  }, [session]);

  return client;
};

export default useChainApiClient;
