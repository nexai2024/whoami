import React from 'react';

export const ProductCard = () => { 
  return (
    <div className="items-center cursor-pointer flex-col justify-center py-2 px-16 relative flex min-h-[4.00rem] gap-[0.13rem] bg-color(srgb 0.93 0.93)">
  <div className="items-center bottom-[0.50rem] justify-center left-[0.50rem] absolute top-[0.50rem] flex w-12 h-12 rounded overflow-hidden">
    <img className="object-cover w-full h-full max-w-full" src="https://ugc.production.linktr.ee/NTNdVeQFQreuM15hzMxJ_cinnamon_sugar_pancakes.jpg?io=true&size=thumbnail-stack_v1_0" />
  </div>
  <div className="font-medium text-center text-ellipsis w-full overflow-hidden">Cinnamon Sugar Pancakes</div>
</div>
  );
};
export const BioHeader = () => {
    return (
        <div className="items-center flex-col relative flex">
  <img className="object-contain w-24 h-auto max-w-full rounded-full" src="https://ugc.production.linktr.ee/c74f3276-e60f-4486-955b-a092789190c7_donna-hay-portrait-2022.jpeg?io=true&size=avatar-v3_0" />
  <div className="items-end justify-center relative flex max-w-full">
    <h1 className="text-2xl font-semibold text-center">@donna.hay</h1>
    <div className="bottom-0 absolute right-0">
      <img
        className="w-4 h-auto max-w-full"
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04LjUyNDcgMTUuMTIzNEM4LjIwMyAxNC45MjUxIDcuNzk3IDE0LjkyNTEgNy40NzUzIDE1LjEyMzRMNy4xNDg3MyAxNS4zMjQ3QzYuNjk0MiAxNS42MDQ4IDYuMDk5NzQgMTUuNDc4NSA1Ljc5ODQ1IDE1LjAzNzdMNS41ODE5OSAxNC43MjFDNS4zNjg3NSAxNC40MDkgNC45OTc4NSAxNC4yNDM4IDQuNjIzMzIgMTQuMjk0MUw0LjI0MzExIDE0LjM0NTJDMy43MTM5MiAxNC40MTYyIDMuMjIyMjYgMTQuMDU5IDMuMTI2MzEgMTMuNTMzOEwzLjA1NzM3IDEzLjE1NjRDMi45ODk0NyAxMi43ODQ3IDIuNzE3OCAxMi40ODMgMi4zNTUxOSAxMi4zNzY2TDEuOTg3MDkgMTIuMjY4NkMxLjQ3NDc1IDEyLjExODIgMS4xNzA4OCAxMS41OTE5IDEuMjk2ODcgMTEuMDczMUwxLjM4NzM4IDEwLjcwMDNDMS40NzY1NSAxMC4zMzMgMS4zNTEwOSA5Ljk0NjkyIDEuMDYzMSA5LjcwMjI0TDAuNzcwNzU3IDkuNDUzODVDMC4zNjM4NTIgOS4xMDgxMyAwLjMwMDMyNyA4LjUwMzczIDAuNjI2NDYyIDguMDgwOTZMMC44NjA3NzcgNy43NzcyMkMxLjA5MTYgNy40NzgwMSAxLjEzNDA0IDcuMDc0MjQgMC45NzA0NjggNi43MzM1OEwwLjgwNDQyNCA2LjM4Nzc2QzAuNTczMzE0IDUuOTA2NDMgMC43NjExMTQgNS4zMjg0NCAxLjIzMTAxIDUuMDc0ODhMMS41Njg2MSA0Ljg5MjdDMS45MDExNyA0LjcxMzI0IDIuMTA0MTcgNC4zNjE2NCAyLjA5MzMgMy45ODM5TDIuMDgyMjcgMy42MDA0NEMyLjA2NjkyIDMuMDY2NzIgMi40NzM1NyAyLjYxNTA5IDMuMDA1OTcgMi41NzQ1N0wzLjM4ODQ4IDIuNTQ1NDZDMy43NjUyOSAyLjUxNjc4IDQuMDkzNzUgMi4yNzgxNCA0LjIzNzQ2IDEuOTI4NjRMNC4zODMzNSAxLjU3Mzg1QzQuNTg2NCAxLjA4MDAyIDUuMTQxNiAwLjgzMjgzNiA1LjY0NDQ1IDEuMDEyMzdMNi4wMDU3MyAxLjE0MTM1QzYuMzYxNjMgMS4yNjg0MiA2Ljc1ODc1IDEuMTg0MDEgNy4wMzIxOSAwLjkyMzE3M0w3LjMwOTc4IDAuNjU4MzkxQzcuNjk2MTMgMC4yODk4NTIgOC4zMDM4NyAwLjI4OTg1MiA4LjY5MDIyIDAuNjU4MzkyTDguOTY3ODEgMC45MjMxNzNDOS4yNDEyNSAxLjE4NDAxIDkuNjM4MzcgMS4yNjg0MiA5Ljk5NDI3IDEuMTQxMzVMMTAuMzU1NSAxLjAxMjM3QzEwLjg1ODQgMC44MzI4MzYgMTEuNDEzNiAxLjA4MDAyIDExLjYxNjcgMS41NzM4NUwxMS43NjI1IDEuOTI4NjRDMTEuOTA2MyAyLjI3ODE0IDEyLjIzNDcgMi41MTY3OCAxMi42MTE1IDIuNTQ1NDZMMTIuOTk0IDIuNTc0NTdDMTMuNTI2NCAyLjYxNTA5IDEzLjkzMzEgMy4wNjY3MiAxMy45MTc3IDMuNjAwNDRMMTMuOTA2NyAzLjk4MzlDMTMuODk1OCA0LjM2MTY0IDE0LjA5ODggNC43MTMyNCAxNC40MzE0IDQuODkyN0wxNC43NjkgNS4wNzQ4OEMxNS4yMzg5IDUuMzI4NDQgMTUuNDI2NyA1LjkwNjQzIDE1LjE5NTYgNi4zODc3NkwxNS4wMjk1IDYuNzMzNThDMTQuODY2IDcuMDc0MjQgMTQuOTA4NCA3LjQ3ODAxIDE1LjEzOTIgNy43NzcyMkwxNS4zNzM1IDguMDgwOTZDMTUuNjk5NyA4LjUwMzczIDE1LjYzNjEgOS4xMDgxMyAxNS4yMjkyIDkuNDUzODVMMTQuOTM2OSA5LjcwMjI0QzE0LjY0ODkgOS45NDY5MiAxNC41MjM0IDEwLjMzMyAxNC42MTI2IDEwLjcwMDNMMTQuNzAzMSAxMS4wNzMxQzE0LjgyOTEgMTEuNTkxOSAxNC41MjUzIDEyLjExODIgMTQuMDEyOSAxMi4yNjg2TDEzLjY0NDggMTIuMzc2NkMxMy4yODIyIDEyLjQ4MyAxMy4wMTA1IDEyLjc4NDcgMTIuOTQyNiAxMy4xNTY0TDEyLjg3MzcgMTMuNTMzOEMxMi43Nzc3IDE0LjA1OSAxMi4yODYxIDE0LjQxNjIgMTEuNzU2OSAxNC4zNDUyTDExLjM3NjcgMTQuMjk0MUMxMS4wMDIxIDE0LjI0MzggMTAuNjMxMyAxNC40MDkgMTAuNDE4IDE0LjcyMUwxMC4yMDE1IDE1LjAzNzdDOS45MDAyNiAxNS40Nzg1IDkuMzA1OCAxNS42MDQ4IDguODUxMjcgMTUuMzI0N0w4LjUyNDcgMTUuMTIzNFoiIGZpbGw9IiMwMEI2RkYiLz4KPHBhdGggZD0iTTUuMDY5OTggNy41NjI2NUw3LjE5MTMgOS42ODM5N0wxMS40MzM5IDUuNDQxMzMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K"
      />
    </div>
  </div>
</div>
);
};
export const BioTopBar = () => {
    return (
        <div className="gap-x-2 justify-between py-3.5 text-right flex max-w-[36.25rem] min-[576px]:pl-[calc(14px_*_2)]  min-[576px]:pr-[calc(14px_*_2)]">
  <button className="bg-white/[0.7] items-center backdrop-blur-sm cursor-pointer justify-center flex w-10 h-10 border-2 border-white/[0.4] border-solid rounded-full">
    <svg className="w-5 h-5" fill="none" height="18px" viewBox="0 0 28 28">
      <path d="m15.7603 6.829 4.6725-4.80317 2.712 2.77734-4.9012 4.67248h6.8944v3.85565h-6.9271l4.9339 4.7922-2.712 2.7229-6.6983-6.731-6.69829 6.731-2.712-2.712 4.93387-4.7923h-6.92703v-3.86645h6.89436l-4.9012-4.67248 2.712-2.77734 4.67249 4.80317v-6.829h4.0516zm-4.0516 12.0243h4.0516v9.1489h-4.0516z" fill="rgb(0, 0, 0)" />
    </svg>
  </button>
  <div className="gap-x-2 flex">
    <button className="bg-white/[0.7] items-center backdrop-blur-sm cursor-pointer text-sm font-semibold justify-center px-3 text-center flex w-10 h-10 border-2 border-white/[0.4] border-solid rounded-full">
      <div className="items-center justify-center flex w-full h-full">
        <div className="min-w-[1.25rem]">
          <svg className="w-5 h-5" fill="rgb(0, 0, 0)" height="20" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" fill="rgb(0, 0, 0)" />
          </svg>
        </div>
        <div className="overflow-hidden">Subscribe</div>
      </div>
    </button>
    <button className="bg-white/[0.7] items-center backdrop-blur-sm cursor-pointer justify-center flex w-10 h-10 border-2 border-white/[0.4] border-solid rounded-full">
      <svg className="w-5 h-5" fill="rgb(0, 0, 0)" height="20" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <path d="M216,112v96a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V112A16,16,0,0,1,56,96H80a8,8,0,0,1,0,16H56v96H200V112H176a8,8,0,0,1,0-16h24A16,16,0,0,1,216,112ZM93.66,69.66,120,43.31V136a8,8,0,0,0,16,0V43.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,69.66Z" fill="rgb(0, 0, 0)" />
      </svg>
    </button>
  </div>
</div>  
);
};
export const BigPicCard = () => {
    return (
        <div
  className='text-blue-700 items-center bg-[url("https://linkstorage.linkfire.com/medialinks/images/f22bc6bd-97a1-4512-83db-7460eb49533c/artwork-640x640")] bg-cover cursor-pointer text-[0.63rem] justify-center pt-[31.25rem] relative text-center flex rounded-lg font-medium'
  style={{
    backgroundPosition: "50% 50%",
  }}>
  <button className="text-white bg-zinc-900/[0.7] bottom-[1.50rem] left-[11.63rem] py-4 px-10 absolute right-[11.63rem] text-ellipsis top-[26.13rem] w-32 h-14 border-2 border-gray-600 border-solid rounded-lg"> Videos </button>
</div>
);
};
