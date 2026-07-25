import { evalService } from "../services/eval.service";

evalService
  .run()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (result.top1Precision < 0.8) process.exit(1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
