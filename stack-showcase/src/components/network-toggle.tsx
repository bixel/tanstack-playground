import { useState } from "react"
import { Wifi, WifiOff } from "lucide-react"

import { network } from "@/api/client"
import { Button } from "@/components/ui/button"

/** Turn on a 50% failure rate in the fake API to watch error + retry handling. */
export function NetworkToggle() {
  const [flaky, setFlaky] = useState(() => network.flaky)

  return (
    <Button
      variant={flaky ? "destructive" : "outline"}
      size="sm"
      onClick={() => {
        network.flaky = !flaky
        setFlaky(!flaky)
      }}
      title="Simulate a flaky network in the in-client API"
    >
      {flaky ? <WifiOff /> : <Wifi />}
      <span className="hidden sm:inline">{flaky ? "Flaky network" : "Stable network"}</span>
    </Button>
  )
}
