import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export const getSingleUserInfo = async (req: Request, res: Response):Promise<any>=> {
    try {
        const { id } = req.params
        console.log(req.params,'profile');
        
        if (!id) {
            return res.status(404).json({ message: 'Not found id' })
        }

        const user = await prisma.user.findUnique({ where: { id } })

        if (!user) {
            return res.status(404).json({ message: 'Not found user' })
        }

        res.json({
            message: 'user found successfully',
            user: {
                name: user?.name,
                email: user?.email,
                role: user?.role,
                image: user?.image,
                address: user?.address,
                district: user?.district,
                division: user?.division,
                thana: user?.thana,
                union: user?.union,
                postCode: user?.postCode,
                phone:user?.phone
            }



        })
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'forgotten id' });
    }
}





export const updateUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
   
        
        const {
            name,
            phone,
            address,
            division,
            district,
            thana,
            union,
            postCode,
            image
        } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                phone,
                address,
                division,
                district,
                thana,
                union,
                postCode,
                image
            }
        });

      
        
        res.json({
            message: 'User updated successfully',
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                division: updatedUser.division,
                district: updatedUser.district,
                thana: updatedUser.thana,
                union: updatedUser.union,
                postCode: updatedUser.postCode,
                image: updatedUser.image
            }
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
};