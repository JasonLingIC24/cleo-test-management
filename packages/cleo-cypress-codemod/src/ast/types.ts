import { Node } from "ts-morph";

export interface DescribeCall {
 node: Node;
 title: string;
 tags: string[];
 hasTagObject: boolean;
}