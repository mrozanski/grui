# Motivation:
The Manufacturers and Models pages currently use a cards layout. The pages for Product Lines, and individual guitars will soon use that too when they are implemented.

# New feature:
A Variation for the list pages that uses a table like layout with one row (and up to three for narrower viewports) for each element alternatively to cards.

# Description:
The table view is called "List view"  in the UI. 
The user is able to toggle between cards and list view. The list view includes less fields for each element than the cards.
The toggle is implemented with a button group with two buttons: "Cards" and "List" using Grid/List icons.

# Implementation:

1. Parent Component with State Management:
Use the current *-list.tsx components as a parent component that manages the state for the currently active view (e.g., listView or cardsView). This can be done using the useState hook.
Include a toggle switch within this parent component to allow users to change the view state. The onClick handler for these elements will update the state.

2. Conditional Rendering:
Inside the parent component's JSX, use conditional rendering to display either the ListView component or the CardsView component based on the state variable.

3. Sub-Components for Views:
Create separate, reusable sub-components for the ListView (e.g., TableComponent) and CardsView (e.g., CardGridComponent).
These sub-components will receive the data as props and handle the specific rendering logic for their respective layouts. This promotes modularity and makes the code easier to maintain.

4. CardsView Component:
This is the current implementation of the cards view.

5. ListView Component:
Make ListView reusable by inferring fields from data
  Include all necessary linking/navigation

Below are the columns of each page's table.
The Id of each item is not visible but needed to link down to the detail, models and product lines pages.

In the case of the manufacturers page the visible fields would be:
- Name
- Country
- Number of models
- number of product lines

For models:
- Manufacturer name
- model Name
- Model Year
- Product Line name
- Production type

Product lines and individual guitars will be tackled separately. At the moment, we have models and manufacturters cards views implemented.

6. Structure and design
Table Styling:  use a full HTML table for MVP purposes. We will add more sofisticated styling later and sorting will be implemented later.
Use a horizontal border between each row of color-border-light
No vertical borders.
Responsiveness: On mobile, the table remains as a table, can be horizontally scrolled, and can stack up to three lines of text on each row. We will update the design later.
State Persistence: The user's view preference persists across page refreshes (localStorage)