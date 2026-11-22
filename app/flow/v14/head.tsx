// v14's page heading (v4 pattern): a small pink kicker, the title, one line under it.
import type { ReactNode } from "react";

export function Head({ kicker, title, body, children }: { kicker: string; title: string; body?: string; children?: ReactNode }) {
  return <header className="fl-head"><div><span className="fl-kicker">{kicker}</span><h1>{title}</h1>{body && <p>{body}</p>}</div>{children}</header>;
}
