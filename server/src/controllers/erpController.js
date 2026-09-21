import supabase from "../config/supabase.js";
import { encryptData } from "../utils/encryption.js";
import { keepAliveERP } from "../services/erpService.js";
export const saveERPSession = async (req, res) => {
  try {
    const { cookies } = req.body;

    if (!cookies || typeof cookies !== "string") {
      return res.status(400).json({
        success: false,
        message: "ERP session cookies are required",
      });
    }

    if (cookies.length > 100000) {
      return res.status(400).json({
        success: false,
        message: "ERP session data is too large",
      });
    }

    const encrypted = encryptData(cookies);

    const { data, error } = await supabase
      .from("erp_sessions")
      .upsert(
        {
          user_id: req.userId,
          encrypted_cookies: encrypted.encryptedData,
          encryption_iv: encrypted.iv,
          encryption_auth_tag: encrypted.authTag,
          is_active: true,
          last_keep_alive_at: null,
          last_keep_alive_status: "Not tested",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select(
        "id, is_active, last_keep_alive_at, last_keep_alive_status"
      )
      .single();

    if (error) {
      console.error("Save ERP session error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to save ERP session",
      });
    }

    return res.status(200).json({
      success: true,
      message: "ERP session saved securely",
      session: data,
    });
  } catch (error) {
    console.error("ERP session error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save ERP session",
    });
  }
};

export const testKeepAlive = async (req, res) => {
  try {
    const { data: session, error } = await supabase
      .from("erp_sessions")
      .select("*")
      .eq("user_id", req.userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No ERP session configured",
      });
    }

    const result = await keepAliveERP(session);

    return res.json({
      success: result.success,
      message: result.success
        ? "ERP keep-alive successful"
        : "ERP session may have expired",
      status: result.status,
    });
  } catch (error) {
    console.error("Keep-alive error:", error);

    return res.status(500).json({
      success: false,
      message: "Keep-alive request failed",
    });
  }
};