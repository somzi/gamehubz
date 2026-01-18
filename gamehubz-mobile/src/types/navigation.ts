export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    TournamentDetails: { id: string };
    HubProfile: { id: string };
    PlayerProfile: { id: string };
    Notifications: undefined;
    NotFound: undefined;
    EditProfile: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Tournaments: undefined;
    Hubs: undefined;
    Profile: undefined;
};
