
function Header() {
  return (
<header className="flex items-center justify-center gap-3 py-6 px-4 bg-[#0F0F0F] border border-[#202020] rounded-t-lg">
      <img
        src={`${import.meta.env.BASE_URL}favicon.ico`}
        alt="Logo Diet Control"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
      <h1 className="text-2xl font-bold tracking-tight text-[#F8F8F8]">
        Diet <span className="text-[#5DD62C]">Control</span>
      </h1>
    </header>
  );
}

export default Header;