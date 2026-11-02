// Prototype order store: an in-memory map, saved to a local JSON file (PAYMENT_STORE_FILE, default
// .data/mock-orders.json, which git ignores). Where the disk is read-only (a Netlify function), it
// keeps orders in memory only, so they last as long as that function instance stays warm.
//
// REPLACE WITH REAL GATEWAY: before taking real payments, move orders to a proper database
// (e.g. Netlify Blobs, Supabase or a Google Sheet via Apps Script) so none are lost.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { Order } from './types';

let orders: Map<string, Order> | undefined;
let file: string | undefined;
let diskOk = true;
let saving: Promise<void> = Promise.resolve();

async function load(path?: string): Promise<Map<string, Order>> {
  if (orders) return orders;
  file = resolve(path || '.data/mock-orders.json');
  try {
    const list = JSON.parse(await readFile(file, 'utf8')) as Order[];
    orders = new Map(list.map((o) => [o.id, o]));
  } catch {
    orders = new Map();
  }
  return orders;
}

function save(): Promise<void> {
  if (!diskOk || !orders || !file) return saving;
  const snapshot = JSON.stringify([...orders.values()], null, 2);
  const target = file;
  saving = saving.then(async () => {
    try {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, snapshot);
    } catch (err) {
      diskOk = false;
      console.warn(`[payments] Can't write ${target}; keeping mock orders in memory only.`, err);
    }
  });
  return saving;
}

export function createStore(path?: string) {
  return {
    async get(id: string): Promise<Order | undefined> {
      return (await load(path)).get(id);
    },
    async findByGatewayOrderId(gatewayOrderId: string): Promise<Order | undefined> {
      for (const o of (await load(path)).values()) if (o.gatewayOrderId === gatewayOrderId) return o;
      return undefined;
    },
    async put(order: Order): Promise<Order> {
      (await load(path)).set(order.id, order);
      await save();
      return order;
    },
  };
}

export type OrderStore = ReturnType<typeof createStore>;
