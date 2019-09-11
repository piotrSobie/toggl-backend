interface UserInterface {
    _id: string;
    email: string;
    password: string;
    location: string;
    tokens: { token: string }[];
    refreshToken: string;
}

export default UserInterface;
