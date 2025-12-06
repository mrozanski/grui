# Attestation Flow and API overview

## Decisions made

Pluggable Architecture: Veryfiable Attestation Service
Build it as a separate service that the String Authority (and future apps) can consume

## Architecture decisions (to do)

### Authenticatio nand wallet management

- Compare Dynamic.xyz with RainbowKit and other options for wallet authentication

### Attestations structure

- Choose a basic type of attestation that can be reused for other industries, maybe a text review
- Define the structure and create EAS schema (use script and EAS API to crate to be able to reuse)
- Decide how to link attestations to instruments and products (guitar models). This can be by the ID they have in the String Authority DB, or use another attestation to identify instrument/product (more web3 and less centralised).
- Find best way to link attestations in EAS. (Use case: review linked to instrument ID attestation linked to guitar model)
- Choose what chain to use
- First version can be stored offchain (we save the attestation in the DB), next phase can use IPFS

https://docs.attest.org/docs/core--concepts/schemas

### UI

- Sign up/in (connect wallet)
- New attestation form
- Details page including atytestations

### API

- Create repo for Veryfiable Attestation Service
- Implement MVP endpoints:

```
POST   /api/v1/attestations          // Create attestation
GET    /api/v1/attestations?entityId=X  // Get by entity
GET    /api/v1/attestations/:uid      // Get specific attestation
GET    /api/v1/schemas                // Get all schemas
```

- Similar endponits in String Authority API. These will serve the UI and will talk to the Veryfiable Attestation Service. The String Authority API has access to the DB and needs to be in the middle.