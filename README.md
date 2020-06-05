# BizTime

A REST-ful backend API server for a simple company/invoice tracker.

## Routes Needed

### GET /companies

Returns list of companies, like {companies: [{code, name}, ...]}

### GET /companies/[code]

Return obj of company: {company: {code, name, description}}

If the company given cannot be found, this should return a 404 status response.

### POST /companies

Adds a company.

Needs to be given JSON like: {code, name, description}

Returns obj of new company: {company: {code, name, description}}

### PUT /companies/[code]

Edit existing company.

Should return 404 if company cannot be found.

Needs to be given JSON like: {name, description}

Returns update company object: {company: {code, name, description}}

### DELETE /companies/[code]

Deletes company.

Should return 404 if company cannot be found.

Returns {status: "deleted"}

### GET /invoices

Return info on invoices: like {invoices: [{id, comp_code}, ...]}

### GET /invoices/[id]

Returns obj on given invoice.

If invoice cannot be found, returns 404.

Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

### POST /invoices

Adds an invoice.

Needs to be passed in JSON body of: {comp_code, amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

### PUT /invoices/[id]

Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

### DELETE /invoices/[id]

Deletes an invoice.

If invoice cannot be found, returns a 404.

Returns: {status: "deleted"}

Also, one route from the previous part should be updated:

### GET /companies/[code]

Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

If the company given cannot be found, this should return a 404 status response.
