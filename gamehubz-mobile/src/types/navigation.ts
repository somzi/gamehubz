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
    ChangePassword: undefined;
    HelpCenter: undefined;
    AboutUs: undefined;
    ContactUs: undefined;
    UpdateProfile: undefined;
    ManageHub: { hubId: string };
    HubMembers: { hubId: string };
    ManageHubSocials: { hubId: string };
    MyMatches: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Tournaments: undefined;
    Hubs: undefined;
    Profile: undefined;
};
