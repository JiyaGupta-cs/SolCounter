import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { program, counterPDA, CounterData } from "../anchor/setup";

export default function CounterState() {
  const { connection } = useConnection();
  const [counterData, setCounterData] = useState<CounterData | null>(null);

  useEffect(() => {
    // Fetch initial account data
    program.account.counter.fetch(counterPDA).then((data) => {
      console.log("Initial Data:", data);
      setCounterData(data);
    }).catch((err) => console.error("Error fetching initial data:", err));
  
    // Subscribe to account change
    const subscriptionId = connection.onAccountChange(
      counterPDA,
      (accountInfo) => {
        try {
          const decodedData = program.coder.accounts.decode("counter", accountInfo.data);
          console.log("Decoded Data:", decodedData);
          setCounterData(decodedData);
        } catch (err) {
          console.error("Error decoding account data:", err);
        }
      }
    );

    return () => {
      // Unsubscribe from account change
      connection.removeAccountChangeListener(subscriptionId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  return <p className="text-lg">Count: {counterData?.count?.toString()}</p>;
}