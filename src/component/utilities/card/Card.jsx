import React from 'react'
import style from './card.module.css'

const Card = ({className, children}) => {
  return (
    
    <article className={`${style.card}${className}`}>
            {children}
    </article>
  
  )
}

export default Card