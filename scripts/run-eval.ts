import { evalService } from "../services/eval.service";

evalService
  .run()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (result.top1Precision < 0.8) process.exit(1);
    if (result.matrix.accuracy < 0.9) process.exit(1);
    if (result.guardFalseAcceptRate > 0) process.exit(1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
