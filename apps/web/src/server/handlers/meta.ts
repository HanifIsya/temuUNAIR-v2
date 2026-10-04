// apps/web/src/server/handlers/meta.ts
// API-META-01 (GET /meta/categories), API-META-02 (GET /meta/campuses),
// API-META-03 (GET /meta/locations), API-META-04 (GET /meta/drop-points).

import { getDb } from "../db";
import { PgMetaRepository } from "../repositories/meta";
import {
  CATEGORY_META,
  getCampuses,
  getDropPoints,
  getLocations,
  parseCampusParam,
} from "../services/meta";
import { dispatch } from "./dispatch";

function json(body: unknown, requestId: string, status = 200): Response {
  return Response.json(body, { status, headers: { "X-Request-Id": requestId } });
}

export async function GET_CATEGORIES(request: Request): Promise<Response> {
  return dispatch(request, false, async ({ requestId }) => json(CATEGORY_META, requestId));
}

export async function GET_CAMPUSES(request: Request): Promise<Response> {
  return dispatch(request, false, async ({ requestId }) => {
    const campuses = await getCampuses(new PgMetaRepository(getDb()));
    return json(campuses, requestId);
  });
}

export async function GET_LOCATIONS(request: Request): Promise<Response> {
  return dispatch(request, false, async ({ requestId }) => {
    const campus = parseCampusParam(new URL(request.url).searchParams.get("campus"));
    const locations = await getLocations(new PgMetaRepository(getDb()), campus);
    return json(locations, requestId);
  });
}

export async function GET_DROP_POINTS(request: Request): Promise<Response> {
  return dispatch(request, false, async ({ requestId }) => {
    const campus = parseCampusParam(new URL(request.url).searchParams.get("campus"));
    const dropPoints = await getDropPoints(new PgMetaRepository(getDb()), campus);
    return json(dropPoints, requestId);
  });
}
