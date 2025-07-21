# Primary Image Not Showing

## Issue
I'm testing from my local deployment. The two entities I added a primary image to are showing the default image.

## Example Query for model
```
psql -h localhost -U guitar_registry_user -d guitar_registry -c "
  SELECT i.id, i.entity_type, i.entity_id, i.image_type, i.is_primary, i.caption, i.original_url
  FROM images i
  WHERE i.entity_type = 'model'
  AND i.entity_id = '019820af-3caf-73d0-90ce-700d3f4a1f70'"
```
Shows this data:

Image Details:
  - Image ID: 01982a2c-1c3e-7465-bf4b-a9eb922e1362
  - Entity Type: model
  - Entity ID: 019820af-3caf-73d0-90ce-700d3f4a1f70 (matches the model)
  - Image Type: primary
  - Is Primary: true
  - Caption: Gibson Angus Young SG 2000
  - Original URL: https://res.cloudinary.com/dh6thxkuo/image/upload/v1753054187/guitars/model/019820af-3caf-73d0-90ce-700d3f4a1f70/primary/a6f452b3e5bf872a.jpg

## Example Query for individual guitar

```bash
psql -h localhost -U guitar_registry_user -d guitar_registry -c "
  SELECT i.id, i.entity_type, i.entity_id, i.image_type, i.is_primary, i.caption, i.original_url
  FROM images i
  WHERE i.entity_type = 'individual_guitar'
  AND i.entity_id = '01982952-37dd-7ea1-aba3-1f4ecc8092e7'
  AND i.is_primary = true
```

Shows this data:
  Primary Image Details:
  - Image ID: 01982952-f11c-7f22-bf7f-fa4a9d553768
  - Entity Type: individual_guitar
  - Entity ID: 01982952-37dd-7ea1-aba3-1f4ecc8092e7 (matches the guitar)
  - Image Type: primary
  - Is Primary: true
  - Caption: 1976 Gibson Firebird III Centennial model
  - Original URL: https://res.cloudinary.com/dh6thxkuo/image/upload/v1753039957/guitars/individual_guitar/01982952-37dd-7ea1-aba3-1f4ecc8092e7/primary/37b1d99a4bb6efb4.jpg

Both currently display the default image.
