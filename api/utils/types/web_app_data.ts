export type web_app_data = {
    product: {
        hour: {
            duration: number,
            price: string
        },
        selectedPeriod: {
            duration: number,
            type: string
        },

        price: number,
        initialPrice: number,
        img: string,
        name: string
        date: Date

    }
}