export default function SearchBar() {
  return (
    <li className="hide-phone app-search">
      <form role="search" action="#" method="get">
        <input
          type="search"
          name="search"
          className="form-control top-search mb-0"
          placeholder="Search here..."
        />
        <button type="submit">
          <i className="iconoir-search"></i>
        </button>
      </form>
    </li>
  );
}
