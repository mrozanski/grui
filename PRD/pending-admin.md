# Admin

## Manufacturer Wallet Management

Currently, an admin needs to connect with the manufacturer wallet available in their local metamask.

To open the form:
`/admin/manufacturers/[id]/wallets`

This is a shortcut but needs to be replaced.

Expected behavior:

### Admin

1. Admin routes need to be protected and only accessible to admins.
2. To add a manufacturer wallet, the admin needs a form to manually enter the address (not to connect as if they were the manufacturer).
3. Admin gets a link to share with the manufacturer
4. Only admins can add wallets for manufacturers for MVP.


### Manufacturer

Receives a link to the form, can connect with their wallet and start cosigning attestations.

### Dashboard for manufacturer

http://localhost:3000/dashboard/manufacturer

Currently, they can connect with their wallet and will see pending attestations that have their manufacturer ID associated.
This allows them to cosign the attestations.
If this is decided to be the final solution, then we don't need the cosigner wallet column in the attestation.
This needs to be reviewed when we start adding other types of users (experts, reviewers, etc.).
