import mem from "mem";
import { InscriptionDisplayModel } from "src/components/ListingPanel";
import { sendScript } from "src/services/fcl/send-script";

function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

type FCLArgument = {
  arg: any;
  getType: (t: any) => any;
}

export const fetchAllList = mem(
  async (
    totalAmount: number,
    amountPerReq: number,
    script: string,
    argsInFront: FCLArgument[]
  ): Promise<Promise<InscriptionDisplayModel[]>[]> => {
    const requests: Promise<InscriptionDisplayModel[]>[] = [];
    const limit = amountPerReq;
    let startOffset = 0;
    let endOffset = startOffset + limit - 1;
    while (startOffset + 1 < totalAmount) {
      const req = fetchList(script,
        (arg, t) => [
          ...argsInFront.map(argument => {
            return arg(argument.arg, argument.getType(t))
          }),
          arg(startOffset.toString(), t.Int),
          arg(endOffset.toString(), t.Int),
        ]
      );
      await timeout(100);
      requests.push(req);
      startOffset = Math.min(endOffset + 1, totalAmount);
      endOffset = Math.min(startOffset + limit - 1, totalAmount);
    }
    return requests;
  },
  { maxAge: 5 * 1000 }
);

const fetchList = (
  script: string,
  args?: (arg: any, t: any) => any[]
): Promise<InscriptionDisplayModel[]> => {
  return sendScript(script, args);
};