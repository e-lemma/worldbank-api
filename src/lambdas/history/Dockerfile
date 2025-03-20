FROM public.ecr.aws/lambda/nodejs:22

COPY package.json .
RUN npm install --omit=dev


COPY dist/src/lambdas/history .

CMD [ "main.handler" ]
