import { PaginationArgs } from "./pagination-args.type";
import { PaginationPageInfo } from "./pagination-page-info.type";
import { PaginationOutput } from "./pagination-output.type";
import { PaginationEdge } from "./pagination-edge.type";
import { plainToClass } from "class-transformer";
import { Model, Document } from "mongoose";
import { SortOrder } from "./sort-order.enum";

export async function Pagination<
    D extends Document,
    T extends PaginationOutput
    >(model: Model<D>, type: new () => T, params: PaginationArgs): Promise<T> {
    let result: PaginationOutput = null;
    let items;
    const { first, after, sortBy, sortOrder } = params;
    const totalCount = await model.count({});

    if (!after) {
        items = await model.find({}).sort(
            {
                [sortBy]: sortOrder,
                _id: sortOrder,
            },
        ).limit(first + 1);
    } else {
        const [nextSortBy, nextId] = Buffer.from(after, "base64").toString().split("_");
        items = await model.find({
            $or: [{
                [sortBy]: sortOrder === SortOrder.DESC ? { $lt: nextSortBy } : { $gt: nextSortBy },
            }, {
                // If the sortBy is an exact match, we need a tiebreaker, so we use the _id field from the cursor.
                [sortBy]: nextSortBy,
                _id: sortOrder === SortOrder.DESC ? { $lt: nextId } : { $gt: nextId },
            }],
        }).sort(
            {
                [sortBy]: sortOrder,
                _id: sortOrder,
            },
        ).limit(first + 1);
    }
    if (items.length === 0) {
        result = {
            totalCount: 0,
            pageInfo: {
                endCursor: Buffer.from("").toString("base64"),
                hasNextPage: false,
            },
            edges: [],
        };
        return plainToClass(type, result);
    }
    const hasNext = items.length > first;
    if (items.length > first) {
        items.pop();
    }
    const lastItem = items[items.length - 1];
    const next = `${lastItem[sortBy]}_${lastItem._id.toString()}`;

    const pageInfo: PaginationPageInfo = {
        endCursor: Buffer.from(next).toString("base64"),
        hasNextPage: hasNext,
    };

    const edges: PaginationEdge[] = items.map((item) => {
        const { _id, ...item_body } = item.toObject();
        item_body._id = item.id;
        const cursor = `${item_body[sortBy]}_${item_body._id.toString()}`;
        const edge = {
            node: item_body,
            cursor: Buffer.from(cursor).toString("base64"),
        };
        return edge;
    });
    result = {
        totalCount,
        pageInfo,
        edges,
    };
    return plainToClass(type, result);
}
