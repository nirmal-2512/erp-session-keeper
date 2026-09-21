import axios from "axios";
import supabase from "../config/supabase.js";
import { decryptData } from "../utils/encryption.js";

export const keepAliveERP = async (session) => {
  const cookies = decryptData(
    session.encrypted_cookies,
    session.encryption_iv,
    session.encryption_auth_tag
  );

  const response = await axios.get(
    "https://erp.iitkgp.ac.in/IIT_ERP3/keepAlive.htm",
    {
      headers: {
        Cookie: cookies,
      },
      timeout: 15000,
      validateStatus: () => true,
    }
  );

  const success = response.status >= 200 && response.status < 400;

  await supabase
    .from("erp_sessions")
    .update({
      is_active: success,
      last_keep_alive_at: new Date().toISOString(),
      last_keep_alive_status: success
        ? `Success (${response.status})`
        : `Failed (${response.status})`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.id);

  return {
    success,
    status: response.status,
  };
};