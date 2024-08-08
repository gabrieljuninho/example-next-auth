import { auth } from "@/auth";
import LogoutButton from "@/common/components/ui/auth/logout-button";

const HomePage = async () => {
  const session = await auth();

  return (
    <>
      {JSON.stringify(session)}
      <LogoutButton />
      <div>Home Page</div>
    </>
  );
};

export default HomePage;
