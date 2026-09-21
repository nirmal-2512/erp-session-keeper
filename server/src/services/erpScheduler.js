import cron from "node-cron";
import supabase from "../config/supabase.js";
import { keepAliveERP } from "./erpService.js";

export const startERPScheduler = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("Running ERP keep-alive scheduler...");

    try {
      const { data: sessions, error } = await supabase
        .from("erp_sessions")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Scheduler database error:", error);
        return;
      }

      for (const session of sessions || []) {
        try {
          const result = await keepAliveERP(session);

          console.log(
            `ERP session ${session.id}: ${result.status}`
          );
        } catch (error) {
          console.error(
            `ERP session ${session.id} failed:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error(
        "ERP scheduler error:",
        error.message
      );
    }
  });

  console.log("ERP keep-alive scheduler started.");
};